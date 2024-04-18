declare @_ATApplicationID bigint = @ATApplicationID

select count(*) as totalCount
from ATApplicationNote
where ATApplicationID = @_ATApplicationID

select  ID as id,
		ATApplicationID as atApplicationId,
		NoteEntryDate as noteEntryDate,
		NoteEnteredByUsername as noteEnteredByUsername,
		Note as note
from ATApplicationNote
where ATApplicationID = @_ATApplicationID
order by NoteEntryDate