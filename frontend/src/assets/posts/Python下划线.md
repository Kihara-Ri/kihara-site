---
title: Python下划线 
date: 2023-12-17
tags: 
  - python
  - 语法
categories: 
  - Log
---

# Python 下划线

When learning Python many people don’t really understand why so much underlines in the beginning of the methods, sometimes even in the end like `__this__`! I’ve already had to explain it so many times, it’s time to document it.

<!-- more -->

## One underline in the beginning

Python doesn’t have real private methods, so one underline in the beginning of a method or attribute means you shouldn’t access this method, because it’s not part of the API. It’s very common when using properties:

```
class BaseForm(StrAndUnicode):
    ...

    def _get_errors(self):
        "Returns an ErrorDict for the data provided for the form"
        if self._errors is None:
            self.full_clean()
        return self._errors

    errors = property(_get_errors)
```

This snippet was taken from django source code (django/forms/forms.py). This means `errors` is a property, and it’s part of the API, but the method this property calls, `_get_errors`, is “private”, so you shouldn’t access it.

## Two underlines in the beginning

This one causes a lot of confusion. It should **not** be used to mark a method as private, the goal here is to avoid your method to be overridden by a subclass. Let’s see an example:

```
class A(object):
    def __method(self):
        print "I'm a method in A"

    def method(self):
        self.__method()

a = A()
a.method()
```

The output here is

```
$ python example.py
I'm a method in A
```

Fine, as we expected. Now let’s subclass `A` and customize `__method`

```
class B(A):
    def __method(self):
        print "I'm a method in B"

b = B()
b.method()
```

and now the output is…

```
$ python example.py
I'm a method in A
```

as you can see, `A.method()` didn’t call `B.__method()` as we could expect. Actually this is the correct behavior for `__`. So when you create a method starting with `__` you’re saying that you don’t want anybody to override it, it will be accessible just from inside the own class.

How python does it? Simple, it just renames the method. Take a look:

```
a = A()
a._A__method()  # never use this!! please!
$ python example.py
I'm a method in A
```

If you try to access `a.__method()` it won’t work either, as I said, `__method` is just accessible inside the class itself.

## Two underlines in the beginning and in the end

When you see a method like `__this__`, the rule is simple: don’t call it. Why? Because it means it’s a method python calls, not you. Take a look:

```
>>> name = "igor"
>>> name.__len__()
4
>>> len(name)
4

>>> number = 10
>>> number.__add__(20)
30
>>> number + 20
30
```

There is always an operator or native function that calls these *magic methods*. The idea here is to give you the ability to override operators in your own classes. Sometimes it’s just a hook python calls in specific situations. `__init__()`, for example, is called when the object is created so you can initialize it. `__new__()` is called to build the instance, and so on…

Here’s an example:

```
class CrazyNumber(object):

    def __init__(self, n):
        self.n = n

    def __add__(self, other):
        return self.n - other

    def __sub__(self, other):
        return self.n + other

    def __str__(self):
        return str(self.n)

num = CrazyNumber(10)
print num           # 10
print num + 5       # 5
print num - 20      # 30
```

Another example:

```
class Room(object):

    def __init__(self):
        self.people = []

    def add(self, person):
        self.people.append(person)

    def __len__(self):
        return len(self.people)

room = Room()
room.add("Igor")
print len(room)     # 1
```

The [documentation](http://docs.python.org/reference/datamodel.html#special-method-names) covers all these special methods.

## Conclusion

Use `_one_underline` to mark you methods as not part of the API. Use `__two_underlines__`when you’re creating objects to look like native python objects or you wan’t to customize behavior in specific situations. And don’t use `__just_to_underlines`, unless you really know what you’re doing!

## References

1. [Difference between _, __ and __xx__ in Python](https://igorsobreira.com/2010/09/16/difference-between-one-underline-and-two-underlines-in-python.html)