declare @_employeeId as int = @employeeId

--Get total count for pagination 
select count(*) as totalCount from EmployeeReview as er
left join ReviewType as rt
on er.ReviewTypeID = rt.ID
where EmployeeID = @_employeeId

select er.*, rt.CompanyID, rt.Code, rt.Description, rt.Priority, rt.Active from EmployeeReview as er
left join ReviewType as rt
on er.ReviewTypeID = rt.ID
where EmployeeID = @_employeeId
order by ScheduledDate 