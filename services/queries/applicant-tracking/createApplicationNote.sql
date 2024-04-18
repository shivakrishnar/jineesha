insert into ATApplicationNote(
	ATApplicationID,
    NoteEntryDate,
    NoteEnteredByUserName,
    Note   
) values (
	@ATApplicationID,
    @NoteEntryDate,
    @NoteEnteredByUserName,
    @Note
)

select SCOPE_IDENTITY() as ID