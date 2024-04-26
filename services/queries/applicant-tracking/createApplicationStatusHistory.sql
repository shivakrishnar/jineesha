insert into ATApplicationStatusHistory (
	ATApplicationID,
	StatusChangedDate,
	StatusChangedByUsername,
	ChangedStatusTitle
) values (
	@ATApplicationID,
	@StatusChangedDate,
	@StatusChangedByUsername,
	@ChangedStatusTitle
)
select SCOPE_IDENTITY() as ID