insert into ATApplicationVersion(
	CompanyID,
	Title,
	Description,
	KeywordList,
	ATApplicationVersionDate,
	IsSectionOnEmploymentHistory,
	IsSectionOnEducationHistory,
    IsSectionOnWorkConditions,
    IsSectionOnDocuments,
    IsSectionOnCertification,
    IsSectionOnPayHistory,
    JazzHrPositionOpeningID
) values (
	@CompanyID,
	@Title,
	@Description,
	@KeywordList,
	@ATApplicationVersionDate,
	@IsSectionOnEmploymentHistory,
	@IsSectionOnEducationHistory,
    @IsSectionOnWorkConditions,
    @IsSectionOnDocuments,
    @IsSectionOnCertification,
    @IsSectionOnPayHistory,
    @JazzHrPositionOpeningID
)
select SCOPE_IDENTITY() as ID
