declare @_searchBy nvarchar(50) = @searchBy

select
	count(*) as totalCount
from
	Roles inner join
	Systems on Roles.SystemID = Systems.ID
where
	concat(Roles.Name, Systems.Name) like '%' + @_searchBy + '%'

select
	Roles.ID as id,
	Roles.SystemID as systemId,
	Systems.Name as systemName,
	Roles.Name as name,
	Roles.IsAdmin as isAdmin
from
	Roles inner join
	Systems on Roles.SystemID = Systems.ID
where
	concat(Roles.Name, Systems.Name) like '%' + @_searchBy + '%'
order by
	Systems.Name,
	Roles.Name
