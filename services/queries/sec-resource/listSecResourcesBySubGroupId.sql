declare @_subGroupId as int = @subGroupId;

-- Get total count for pagination
select
    count(*) as totalCount
from
    dbo.SecResource as sr
where
    sr.ResourceSubGroupId = @_subGroupId

select 
    * 
from 
    dbo.SecResource as sr
where 
    sr.ResourceSubGroupId = @_subGroupId
order by ID