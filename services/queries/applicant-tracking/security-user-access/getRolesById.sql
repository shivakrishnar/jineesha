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
	Roles.ID = @id
