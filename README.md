# Book DB Play

Muneer's Assement 2 - Server Side Foundations


### API Descriptions

Here are the various ways of calling the APIs and a description of all the parameters involved.

```
/api/books/1
```
This will return the details of the book with id=1.


```
/api/books
```
This will return the details of the first 10 books in the table - sorted by Title in Ascending order.


```
/api/books?offset=3&limit=5
```
This will return the details of the first 5 books - sorted by Title in Ascending order after an offset of 3. (Books 4 to 8 in the table)
Offset defaults to 0 if not specified.
Limit defaults to 10 if not specified


```
/api/books?author=Daisy
```
This will return the details of the first 10 books where Author's First Name or Last Name matches Daisy - sorted by Title in Ascending.


```
/api/books?title=fairy
```
This will return the details of the first 10 books where title matches Fairy - sorted by Title in Ascending.


```
/api/books?title=Air&author=meadow
```
This will return the details of the first 10 books where title matches Air and Author's First Name or Last Name matches meadow  - sorted by Title in Ascending.


```
/api/books?sortby=<sort_keyword>
```
As you would have noticed, our data is always sorted by Title in Ascending order by default. If you wan to change the order of sorting, you can use the following options to replace <sort_keyword> above.

author_asc   -  Sort by Author's Last Name in ascending order
author_desc  -  Sort by Author's Last Name in descending order
title_desc   -  Sort by Title in descending order.

## Authors

* **Muneer Shareiff** - *Initial work*