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
	Claims.ID = @id
