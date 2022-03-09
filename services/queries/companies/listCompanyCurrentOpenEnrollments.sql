declare @_companyId as int = @companyId

-- Get total count for pagination
select count(*) as totalCount from OpenEnrollment
where CompanyID = @_companyId
and GETDATE() between StartDate and EndDate

select *, 'CurrentlyOpen' = CASE WHEN GETDATE() between StartDate and EndDate then 1 else 0 end
from OpenEnrollment
where CompanyID = @_companyId
and GETDATE() between StartDate and EndDate
order by ID
