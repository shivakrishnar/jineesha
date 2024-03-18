select
	ID as id,
	Code as code,
	Description as description,
	Priority as priority,
	Active as active
from 
	ATHardStatusType
order by
	Active Desc,
    Priority,
    Description