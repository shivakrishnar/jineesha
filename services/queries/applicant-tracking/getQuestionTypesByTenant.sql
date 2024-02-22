select
	ID as id,
	Code as code,
	Description as description,
	Priority as priority,
	Active as active
from 
	ATQuestionType
where
	concat(Code, Description) like '%' + @searchBy + '%'
order by
	Priority,
	Description