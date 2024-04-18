S1
From https://stackoverflow.com/questions/66669887/combining-2-complex-queries-in-sql-server
Combining 2 complex queries in SQL Server

Answer snippet:

```
with cte(MainArt,secondaryArt, Quantity) as(
SELECT t_mitm, t_sitm, t_qana
            FROM ttibom010201
        WHERE TRIM(t_mitm) = 'ACL-4812070395-4'
union all
select
ttibom010201.t_mitm, ttibom010201.t_sitm, ttibom010201.t_qana
from ttibom010201 inner join cte on cte.secondaryArt=ttibom010201.t_mitm
        )
select    cte.* ,dsc.t_cuni, dsc.t_dsca, t_pric from cte
left join ttcibd001201 dsc on dsc.t_item = cte.secondaryArt
Left join (select top 1 t_orno, t_item,t_pric,row_number()over(partition by t_item order by t_ddte desc) rnfrom ttdpur401201 ) t
on t.t_item like cte.secondaryArt  and t.rn=1
where TRIM(secondaryArt)  like N'30%'
```

End of S1

S2
