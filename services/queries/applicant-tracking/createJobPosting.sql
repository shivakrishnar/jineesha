insert into ATJobPosting(
	CompanyID,
	ATApplicationVersionID,
	PositionTypeID,
	OrganizationType1ID,
	OrganizationType2ID,
	OrganizationType3ID,
	OrganizationType4ID,
	WorkerCompTypeID,
	Title,
	Description,
	LinkKey,
	IsOpen,
	JazzHrPositionOpeningID
) values (
	@CompanyID,
	@ATApplicationVersionID,
	@PositionTypeID,
	@OrganizationType1ID,
	@OrganizationType2ID,
	@OrganizationType3ID,
	@OrganizationType4ID,
    @WorkerCompTypeID,
    @Title,
    @Description,
    @LinkKey,
    @IsOpen,
    @JazzHrPositionOpeningID
)

select SCOPE_IDENTITY() as ID