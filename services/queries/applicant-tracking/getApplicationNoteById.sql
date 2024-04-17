select  ID as id,
		ATApplicationID as atApplicationId,
		NoteEntryDate as noteEntryDate,
		NoteEnteredByUserName as noteEnteredByUserName,
		Note as note
from ATApplicationNote
where ID = @ID