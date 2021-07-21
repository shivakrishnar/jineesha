-- Get total count for pagination
select
    count(*) as totalCount
from
    dbo.SecResourceSubGroup

select 
    * 
from 
    dbo.SecResourceSubGroup
order by ID