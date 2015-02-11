{
	"author": "Tom Beckmann",
	"title": "Async and Threading"
}

# Async and Threading

Executing code asynchronously is an essential requirement for any responsive UI, allowing a long running background task to be run while the user interface stays responsive.

Apart from using threads (which may create constraints on your existing codebase), you can use the `async` keyword.

The `async` keyword executes the background in the same thread, removing the need to care about mutexes, thread synchronization and thread safe implementations.

[This tutorial](http://to.bedone.com) details the async concepts (as opposed to basic threading). If anything, [the official async tutorial](https://wiki.gnome.org/Projects/Vala/Tutorial#Asynchronous_Methods) is also available.

Vala/GLib has a couple of utilities in this area which we will explore a little in this article.

## The `async` keyword

First, vala's `async` keyword. By itself, prefixing your methods with an "async" won't do anything at all. It will however tell vala that you intend to make this method execute a long running task, for which it will then give you some utilities.

First, you'll be able to call async methods with a .begin

> Note : in previous versions of vala (since XXX) you were allow to  leave out the `.begin`. But this not recommended and deprecated.

Take for example this method:

```vala
public async void do_some_long_tasks () {
    var i = 0;
    while (i < 100000) {
        print ("I do pretty vala code efficiently.\n");
        i++;
    }
}
```

It will be called with `do_some_long_tasks.begin ();` but will block your ui, even though you used `async`. We will revisit this specific behavior in the part about threads. Now further onto `.begin`, if we want to pass arguments or return a value from an `async` method, there are some things to note. Arguments to an `async` method will be put inside the `.begin` parentheses and the last argument of each `.begin` is an optional callback that is called when your `async` method returns. The callback takes the object on which the `async` method was called as first argument and a specific result set as as second. You can use this result set to get the return value of the `async` function by calling the function with `.end`, just like with `.begin`. So a more complex function may look like this:

```vala
public int give_and_take (int a, string b) { ... }

give_and_take.begin (5, "text!", (obj, res) => {
    int my_return_value = give_and_take.end (res);
});
```

The thing utility that vala provides you with within an async method is the `yield` statement. It allows you to spawn another `async` method in your existing `async` method in a way that it will block only that outer `async` method. This schema can basically completely avoid the famous javascript callback hell, by allowing you to write code that actually depends on callback as seen for `begin` example in a way that looks completely sequential. Take this function as an example that tests if a given folder exists and only if it does, if will create a file, both asynchronously. (If you're wondering why we're not using `File.query_exists()`, it uses the blocking `File.query_info()` instead of the non-blocking `File.query_info_async()` and we don't want our function to block.)

```vala
async bool safe_create_file (string folder, string name, string contents) {
    var folder = File.new_for_path (folder);
    try {
        yield folder.query_info_async ("", FileQueryInfoFlags.NONE);
    } catch (IOError.NOT_FOUND e) {
        warning ("Folder does exist, not creating file.");
        return false;
    } catch (Error e) {
        warning (e.message);
        return false;
    }

    // if query_info_async didn't fail, we can safely proceed
    var file = folder.get_child (name);
    try {
        var file_write_stream = yield file.create_async (FileCreateFlags.NONE);
        // write_async takes a uint8 array as argument for the data, we can just give it the
        // data field of our string, which conveniently holds the data of the string as uint8 array
        yield file_write_stream.write_async (contents.data);
    } catch (Error e) {
        warning ("Failed to create and write to file: %s", e.message);
        return false;
    }
    
    // if we reach this point all went fine!
    return true;
}
```

As you can see, thanks to the yield statement, we were able to put a lot of asynchronous functions in sequence, instead of either firing them all of at once, which obviously would have failed miserably, since we can't write to a file that doesn't exist just yet or having that giant horizontal indentation tree that you probably would have gotten in a javascript implementation (without promises), which may have looked like this, in pseudo code

```vala
// not actual code !!!
query_exists_async.begin ((obj, res) => {
    var does_exist = query_exists_async.end (res);
    if (!does_exist)
        return;
    create_file_async.begin ((obj, res) => {
        var file_write_stream = create_file.end (res);
        file_write_stream.write_async (my_data, (obj, res) => {
             if (file_write_stream.write_async.end (res))
                 print ("Hooray, we wrote our data!");
             else
                 warning ("Write failed :'(");
        });
    });
});
```
The fact that this function is shorter that the other one is really only due to the fact that this is simple pseudo code.

The last thing that is special for `async` methods, is the `callback` method that is provided within an `async` method. It allows implementing your own actual asynchronous methods, take this one as a non-real-world example:

```vala
async void my_async_method () {
    // we just wait for 2 seconds, because why not.
    Timeout.add (2000, () => {
        // read next comment first, then this one!
        //
        // similarly to .begin and .end, we call .callback on the our method name,
        // which tells the first blank yield statement in this method that we're done
        // now and like to continue after it. So in this case, after 2 seconds of waiting
        // we'd jump down right to the print statement and just continue from that point.
        my_async_method.callback ();
        return false;
    });

    // a yield without any further function calls tells vala to just wait in this
    // async method, important is that it is non-blocking waiting. So this async method
    // does nothing until the 2s timeout is finally done, the comment to which you may
    // read now.
    yield;

    print ("We're done!");
}
```

## Handling errors

If an `async` method throws an error, you have to `catch` it at the `.end` statement, wrapping the try-catch-block around the `.begin` will have no effect.
// TODO !! also mention Cancellables

## Actual Threads

Looking back at the very first example, we were going to do a very long running task, so we put it in an `async`, hoping that it wouldn't block our ui then. `async` does not actually mean in a different thread and thus non-blocking in vala though, you can only assume that the `async` method is implemented in a non-blocking way. `async` really only means that you get the opportunity to sequence multiple asynchronous operations via `yield` and receive the return value of a function later via the `.begin` and `.end` calls.
Take this program for another example:

```vala
// compile with valac --pkg gio-2.0 file.vala

public async void awfully_long_operation ()
{
    var i = 0;
    while (i < 1000000000)
        i++;
}

void main (string[] args)
{
    awfully_long_operation.begin ((obj, res) => {
        awfully_long_operation.end (res);

        print ("We're done");
    });

    print ("Continuing.n");
}
```

If you run it, you'll notice that it takes quite some time until the "Continuing" is printed. As just discussed, async methods will not turn code magically into tasks that run in parallel. Threads, however, will:

```vala
// compile with valac --pkg gio-2.0 --target-glib 2.32 file.vala
// the target-glib part is important, otherwise you'll need to use a different
// way of creating threads, which we will not cover here since it's deprecated.

public async void awfully_long_operation ()
{
    // we create a new threads. The generic void*, which is just a simple pointer
    // is the return value of the thread, which we will not use. A return value of
    // a thread can be obtained by calling join() on the thread object, which causes
    // your loop to wait until the thread finishes. This is for example useful when
    // writing a game, where physics are in separate thread. If the rendering in the
    // mainloop finishes before the physics, you can't proceed yet, but have to wait
    // until physics are ready as well. We'll just return null here, since we don't care
    // about the return value.
    new Thread<void*> (null, () => {
        var i = 0;
        while (i < 1000000000)
            i++;

        return null;
    });
}

void main (string[] args)
{
    awfully_long_operation.begin ((obj, res) => {
        awfully_long_operation.end (res);

        print ("We're donen");
    });

    print ("Continuing.n");

    new MainLoop ().run ();
}
```

Now you'll see both printed, just as the program starts. Which is wrong as well, we were actually expecting "We're done" to be printed once the calculation is finished and I can assure you that wrapping the code in a thread didn't magically sped up your computer to finish this calculation faster than before. If your memory is good, you may remember the `.callback` together with the blank `yield` we had at the start. It allows us to have our `async` method wait at its end until the thread is actually finished and only then have the `async` method run our callback:

```vala
public async void awfully_long_operation ()
{
    new Thread<void*> (null, () => {
        var i = 0;
        while (i < 100000000)
            i++;

        // here we call the callback. However we don't do it directly. If you want to
        // continue your async method from a thread, glib requires you to schedule the
        // callback with an idle, it will throw warnings otherwise. We will see the need
        // for idles within threads further at the bottom in the part about notifications again.
        Idle.add (awfully_long_operation.callback);

        return null;
    });

    // we call a blank yield as above, so we just sit and wait here now.
    yield;
}

void main (string[] args)
{
    awfully_long_operation.begin ((obj, res) => {
        awfully_long_operation.end (res);

        print ("We're donen");
    });

    print ("Continuing.n");

    new MainLoop ().run ();
}
```

Now everything works as we expect it to. "Continuing" is printed as soon as the program starts and after some delay, when our calculations are finished, the "We're done" follows.

## Notifications

Calling any Gtk function from a thread other than the main one will result to "undefined behavior" according to the Gtk docs. You typically won't want to find out what precisely this may mean in your case, but rather use proper ways of communicating to the ui from within your thread, which is a task that you may have to do quite often, in order to provide feedback to the user about progress of the asynchronous operation.

// TODO samples, more text.


## Reference

&nbsp;
