update ATApplicationVersion set
	Title = @Title,
	Description = @Description,
	KeywordList = @KeywordList,
	ATApplicationVersionDate = @ATApplicationVersionDate,
	IsSectionOnEmploymentHistory = @IsSectionOnEmploymentHistory,
	IsSectionOnEducationHistory = @IsSectionOnEducationHistory,
    IsSectionOnWorkConditions = @IsSectionOnWorkConditions,
    IsSectionOnKeywords = @IsSectionOnKeywords,
    IsSectionOnDocuments = @IsSectionOnDocuments,
    IsSectionOnCertification = @IsSectionOnCertification,
    IsSectionOnPayHistory = @IsSectionOnPayHistory,
    JazzHrPositionOpeningID = @JazzHrPositionOpeningID
where
    ID = @ID