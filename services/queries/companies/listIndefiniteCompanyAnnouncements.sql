declare @_companyId as int = @companyId

select count(*) as totalCount
from Announcement
where CompanyID = @_companyId
and IsOn = 1
and ExpiresDate is null

select *
from Announcement
where CompanyID = @_companyId
and IsOn = 1
and ExpiresDate is null
order by IsHighPriority desc, postDate desc
