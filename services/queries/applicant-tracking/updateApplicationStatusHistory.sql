update ATApplicationStatusHistory set
	ATApplicationID = @ATApplicationID,
	StatusChangedDate = @StatusChangedDate,
	StatusChangedByUsername = @StatusChangedByUsername,
	ChangedStatusTitle = @ChangedStatusTitle
where
	ID = @ID