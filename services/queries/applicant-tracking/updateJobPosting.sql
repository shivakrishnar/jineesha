update ATJobPosting
set
	ATApplicationVersionID = @ATApplicationVersionID,
	PositionTypeID = @PositionTypeID,
	OrganizationType1ID = @OrganizationType1ID,
	OrganizationType2ID = @OrganizationType2ID,
	OrganizationType3ID = @OrganizationType3ID,
	OrganizationType4ID = @OrganizationType4ID,
	OrganizationType5ID = @OrganizationType5ID,
	WorkerCompTypeID = @WorkerCompTypeID,
	Title = @Title,
	Description = @Description,
	LinkKey = @LinkKey,
	IsOpen = @IsOpen,
	JazzHrPositionOpeningID = @JazzHrPositionOpeningID
where
    ID = @ID