declare @_searchBy nvarchar(50) = @searchBy

select
	count(*) as totalCount
from
	Claims inner join
	Systems on Claims.SystemID = Systems.ID
where
	concat(Claims.Value, Systems.Name) like '%' + @_searchBy + '%'

select
	Claims.ID as id,
	Claims.SystemID as systemId,
	Systems.Name as systemName,
	Claims.Value as value,
	Claims.Description as description
from
	Claims inner join
	Systems on Claims.SystemID = Systems.ID
where
	concat(Claims.Value, Systems.Name) like '%' + @_searchBy + '%'
order by
	Systems.Name,
	Claims.Value
