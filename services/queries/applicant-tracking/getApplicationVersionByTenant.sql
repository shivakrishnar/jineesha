select appVer.ID as id,
	   appVer.CompanyID as companyId,
	   c.CompanyName as companyName,
	   appVer.Title as title,
	   appVer.Description as description,
	   appVer.KeywordList as keywordList,
	   appVer.ATApplicationVersionDate as aTApplicationVersionDate,
	   appVer.IsSectionOnEmploymentHistory as isSectionOnEmploymentHistory,
	   appVer.IsSectionOnEducationHistory as isSectionOnEducationHistory,
	   appVer.IsSectionOnWorkConditions as isSectionOnWorkConditions,
	   appVer.IsSectionOnKeywords as isSectionOnKeywords,
	   appVer.IsSectionOnDocuments as isSectionOnDocuments,
	   appVer.IsSectionOnCertification as isSectionOnCertification,
	   appVer.IsSectionOnPayHistory as isSectionOnPayHistory,
	   appVer.JazzHrPositionOpeningID as jazzHrPositionOpeningID
from ATApplicationVersion appVer
        inner join Company c on c.id = appVer.CompanyID
order by appVer.Title