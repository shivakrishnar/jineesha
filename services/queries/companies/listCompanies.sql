declare @_search as nvarchar(max) = '%' + @search + '%';

-- Get total count for pagination
select
    count(*) as totalCount
from
    dbo.Company
where
    concat(CompanyName, PRIntegrationCompanyCode) like @_search
    and IsActive = 1

select
    ID,
    CompanyName,
    PRIntegrationCompanyCode,
    CreateDate
from
    dbo.Company
where
    concat(CompanyName, PRIntegrationCompanyCode) like @_search
    and IsActive = 1