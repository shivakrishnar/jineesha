SELECT
    cd.EmployeeBenefitID,
    ed.FirstName,
    ed.LastName,
    drt.RelationshipType,
    ft.Description
FROM
    dbo.CoveredDependent cd
LEFT JOIN dbo.EmployeeDependent ed ON ed.ID = cd.EmployeeDependentID 
LEFT JOIN dbo.DependentRelationshipType drt ON drt.ID = ed.DependentRelationshipTypeID
LEFT JOIN dbo.Employee e on e.ID = ed.EmployeeID
LEFT JOIN dbo.FrequencyType ft on ft.ID = e.FrequencyTypeID_EVO
WHERE
   ed.EmployeeID = @employeeId