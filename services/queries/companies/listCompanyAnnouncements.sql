declare @_companyId as int = @companyId

select count(*) as totalCount
from Announcement
where CompanyID = @_companyId

select *
from Announcement
where CompanyID = @_companyId
order by ID
