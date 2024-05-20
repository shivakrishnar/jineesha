declare @_companyId nvarchar(max) = @companyId
declare @_searchBy nvarchar(50) = @searchBy

select
	count(*) as totalCount
from
	ATApplicationStatusHistory ash inner join
	ATApplication app on ash.ATApplicationID = app.ID inner join
	ATJobPosting jp on app.ATJobPostingID = jp.ID inner join
	Company comp on jp.CompanyID = comp.ID
where
	jp.CompanyID in(select * from dbo.SplitString(@_companyId, '-'))
and	concat(comp.CompanyName, ash.ChangedStatusTitle) like '%' + @_searchBy + '%'

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
	jp.CompanyID in(select * from dbo.SplitString(@_companyId, '-'))
and	concat(comp.CompanyName, ash.ChangedStatusTitle) like '%' + @_searchBy + '%'
order by
	ash.ID desc