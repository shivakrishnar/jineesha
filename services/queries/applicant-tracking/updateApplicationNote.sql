update ATApplicationNote
set 
	ATApplicationID = @ATApplicationID,
	NoteEntryDate = @NoteEntryDate,
	NoteEnteredByUsername = @NoteEnteredByUsername,
	Note = @Note
where
    ID = @ID