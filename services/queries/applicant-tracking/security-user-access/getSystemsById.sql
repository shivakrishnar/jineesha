select
	ID as id,
	Name as name,
	Description as description
from
	Systems
where
	ID = @id
