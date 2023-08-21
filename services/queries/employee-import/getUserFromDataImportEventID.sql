declare @_dataImportEventId as int = @dataImportEventId

select u.FirstName, u.LastName, u.Username as Email, e.CreationDate
from dataimportevent e
		inner join HRnextUser u on e.LastUserID = u.id
where e.ID = @_dataImportEventId