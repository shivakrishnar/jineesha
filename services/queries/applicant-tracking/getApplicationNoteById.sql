select  ID as id,
		ATApplicationID as atApplicationId,
		NoteEntryDate as noteEntryDate,
		NoteEnteredByUsername as noteEnteredByUsername,
		Note as note
from ATApplicationNote
where ID = @ID