S1
PostgreSQL recursive parent/child query
https://stackoverflow.com/questions/54907495/postgresql-recursive-parent-child-query

I'm having some trouble working out the PostgreSQL documentation for recursive queries, and wonder if anyone might be able to offer a suggestion for the following.

Here's the data:

                                            Table "public.subjects"
      Column       |            Type             | Collation | Nullable |               Default

-------------------+-----------------------------+-----------+----------+--------------------------------------
id | bigint | | not null | nextval('subjects_id_seq'::regclass)
name | character varying | | |

                                        Table "public.subject_associations"

Column | Type | Collation | Nullable | Default
------------+-----------------------------+-----------+----------+--------------------------------------------------
id | bigint | | not null | nextval('subject_associations_id_seq'::regclass)
parent_id | integer | | |
child_id | integer | | |

Here, a "subject" may have many parents and many children. Of course, at the top level a subject has no parents and at the bottom no children. For example:

parent_id | child_id
------------+------------
2 | 3
1 | 4
1 | 3
4 | 8
4 | 5
5 | 6
6 | 7
What I'm looking for is starting with a child_id to get all the ancestors, and with a parent_id, all the descendants. Therefore:

parent_id 1 -> children 3, 4, 5, 6, 7, 8
parent_id 2 -> children 3

child_id 3 -> parents 1, 2
child_id 4 -> parents 1
child_id 7 -> parents 6, 5, 4, 1
Though there seem to be a lot of examples of similar things about I'm having trouble making sense of them, so any suggestions I can try out would be welcome.
To get all children for subject 1, you can use

A1

WITH RECURSIVE c AS (
SELECT 1 AS id
UNION ALL
SELECT sa.child_id
FROM subject_associations AS sa
JOIN c ON c.id = sa. parent_id
)
SELECT id FROM c;

A1====

A2

CREATE OR REPLACE FUNCTION func*finddescendants(start_id integer)
RETURNS SETOF subject_associations
AS $$
DECLARE
BEGIN
RETURN QUERY
WITH RECURSIVE t
AS
(
SELECT *
FROM subject*associations sa
WHERE sa.id = start_id
UNION ALL
SELECT next.*
FROM t prev
JOIN subject_associations next ON (next.parentid = prev.id)
)
SELECT \* FROM t;
END;

$$
LANGUAGE PLPGSQL;
A2====
S1=================

S2
How to show tables in PostgreSQL?
https://stackoverflow.com/questions/769683/how-to-show-tables-in-postgresql
What's the equivalent to show tables (from MySQL) in PostgreSQL?


A1
From the psql command line interface,

First, choose your database

\c database_name
Then, this shows all tables in the current schema:

\dt
Programmatically (or from the psql interface too, of course):

SELECT * FROM pg_catalog.pg_tables;
The system tables live in the pg_catalog database.
A1======
S2==============


S3 Start
How to compare dates in datetime fields in Postgresql?
https://stackoverflow.com/questions/19469154/how-to-compare-dates-in-datetime-fields-in-postgresql

I have been facing a strange scenario when comparing dates in postgresql(version 9.2.4 in windows).

I have a column in my table say update_date with type timestamp without timezone.
Client can search over this field with only date (e.g: 2013-05-03) or date with time (e.g.: 2013-05-03 12:20:00).

This column has the value as timestamp for all rows currently and have the same date part 2013-05-03, but difference in time part.

When I'm comparing over this column, I'm getting different results. Like the followings:

select * from table where update_date >= '2013-05-03' AND update_date <= '2013-05-03' -> No results

select * from table where update_date >= '2013-05-03' AND update_date < '2013-05-03' -> No results

select * from table where update_date >= '2013-05-03' AND update_date <= '2013-05-04' -> results found

select * from table where update_date >= '2013-05-03' -> results found
My question is how can I make the first query possible to get results, I mean why the 3rd query is working but not the first one?

S3.A1 Start
@Nicolai is correct about casting and why the condition is false for any data. i guess you prefer the first form because you want to avoid date manipulation on the input string, correct? you don't need to be afraid:

SELECT *
FROM table
WHERE update_date >= '2013-05-03'::date
AND update_date < ('2013-05-03'::date + '1 day'::interval);
S3.A1 End
S3 End
===================================================================
$$
