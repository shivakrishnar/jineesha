select
	ash.ID as id,
	jp.CompanyID as companyId,
	comp.CompanyName as companyName,
	ash.ATApplicationID as atApplicationId,
	ash.StatusChangedDate as statusChangedDate,
	ash.StatusChangedByUsername as statusChangedByUsername,
	ash.ChangedStatusTitle as changedStatusTitle
from
	ATApplicationStatusHistory ash inner join
	ATApplication app on ash.ATApplicationID = app.ID inner join
	ATJobPosting jp on app.ATJobPostingID = jp.ID inner join
	Company comp on jp.CompanyID = comp.ID
where
	ash.ID = @id