declare @_searchBy nvarchar(50) = @searchBy

select
	count(*) as totalCount
from
	Systems
where
	concat(Name, Description) like '%' + @_searchBy + '%'

select
	ID as id,
	Name as name,
	Description as description
from
	Systems
where
	concat(Name, Description) like '%' + @_searchBy + '%'
order by
	Name
