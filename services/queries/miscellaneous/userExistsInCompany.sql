declare @userId as int, @_username as varchar(max) = '@username', @_companyId as int = '@companyId'

set @userId = (select top 1 ID from HRnextUser where Username = @_username)

select * from HRnextUserCompany
where HRnextUserID = @userId
and CompanyID = @_companyId