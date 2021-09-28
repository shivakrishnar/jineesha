declare @_employeeId as int = @employeeId;

select
    EmployeeAbsence.SubmitDate,
    EmployeeAbsence.StartDate,
    EmployeeAbsence.ReturnDate,
    EmployeeAbsence.HoursTaken,
    EmployeeAbsence.EvoFK_TimeOffCategoryId,
    AbsenceStatusType.Description
from EmployeeAbsence
join AbsenceStatusType
    on AbsenceStatusTypeID = AbsenceStatusType.ID
where EmployeeID = @_employeeId