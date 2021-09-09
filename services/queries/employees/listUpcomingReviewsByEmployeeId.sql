declare @landingSectionHistoryInMonths as int, @_companyId as int = @companyId, @_employeeId as int = @employeeId

set @landingSectionHistoryInMonths = (select LandingSectionHistoryInMonths from Company where ID = @_companyId)

-- Get total count for pagination
select count(*) as totalCount from EmployeeReview as er
left join ReviewType as rt
on er.ReviewTypeID = rt.ID
where EmployeeID = @_employeeId
and ScheduledDate <= convert(date, DATEADD(month, @landingSectionHistoryInMonths, GETDATE()))
and ScheduledDate  >= convert(date, GETDATE())

select er.*, rt.CompanyID, rt.Code, rt.Description, rt.Priority, rt.Active from EmployeeReview as er
left join ReviewType as rt
on er.ReviewTypeID = rt.ID
where EmployeeID = @_employeeId
and ScheduledDate  <= convert(date, DATEADD(month, @landingSectionHistoryInMonths, GETDATE()))
and ScheduledDate  >= convert(date, GETDATE())
order by ScheduledDate 