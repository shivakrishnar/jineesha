declare @landingSectionHistoryInMonths as int, @_companyId as int = @companyId, @_employeeId as int = @employeeId

set @landingSectionHistoryInMonths = (select LandingSectionHistoryInMonths from Company where ID = @_companyId)

-- Get total count for pagination
select count(*) as totalCount from EmployeeEnrolledClass as ec
left join HRnextClass as hrc
on ec.ClassID = hrc.ID
where EmployeeID = @_employeeId
and ClassTime <= convert(date, DATEADD(month, @landingSectionHistoryInMonths, GETDATE()))
and ClassTime  >= convert(date, GETDATE())

select ec.*, hrc.CompanyID, hrc.Title, hrc.Description, hrc.Duration, hrc.Instructor, hrc.Location, hrc.Credits, hrc.IsOpen, hrc.ClassTime, hrc.ExpirationDate  
from  EmployeeEnrolledClass as ec left join HRnextClass as hrc
on ec.ClassID = hrc.ID
where EmployeeID = @_employeeId
and ClassTime  <= convert(date, DATEADD(month, @landingSectionHistoryInMonths, GETDATE()))
and ClassTime  >= convert(date, GETDATE())
order by ClassTime