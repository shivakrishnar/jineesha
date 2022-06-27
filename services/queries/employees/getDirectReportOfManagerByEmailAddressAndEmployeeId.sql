SELECT
	ID
FROM
	dbo.Employee
WHERE
	CurrentSupervisor1ID = (
		SELECT hnue.EmployeeID
		FROM dbo.HRnextUser hnu
		LEFT JOIN dbo.HRnextUserEmployee hnue ON hnue.HRnextUserID = hnu.ID
		WHERE hnu.Username = '@emailAddress'
	) AND ID = @employeeId