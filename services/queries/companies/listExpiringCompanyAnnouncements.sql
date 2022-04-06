declare @_companyId as int = @companyId

select count(*) as totalCount
from Announcement
where CompanyID = @_companyId
and IsOn = 1
and convert(date, GETDATE()) >= PostDate
and convert(date, GETDATE()) <= ExpiresDate

select *
from Announcement
where CompanyID = @_companyId
and IsOn = 1
and convert(date, GETDATE()) >= PostDate
and convert(date, GETDATE()) <= ExpiresDate
order by IsHighPriority desc, ExpiresDate