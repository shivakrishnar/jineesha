set nocount on

declare @cTenantId				nvarchar(50)    = @TenantId
declare @nCompanyId				bigint          = @CompanyId
declare @nRowNumber				int             = @RowNumber + 1
declare @nDataImportEventId     bigint          = @DataImportEventId
declare @cCSVRow                nvarchar(max)   = @CsvRow

declare @nNbrDelimiters		int
declare @cErrorMessage		varchar(200)
select  @cErrorMessage = ''
declare @nGlobalError_Nbr	tinyint
select  @nGlobalError_Nbr = 0
declare @cDataValue			nvarchar(200)
declare @cColumnsToUpdate	varchar(50)
select  @cColumnsToUpdate = ''
declare @cStatus			int
select  @cStatus = 2
declare @cEmployeeCode		nvarchar(50)
declare @nEmployeeID		bigint

BEGIN TRY 

	  select row_number() over(order by (select 0)) as Row_Num, * 
		into #CSVtable
		from string_split(replace(@cCSVRow, '"',''), ',') 

	  select @cDataValue = value from #CSVtable where Row_Num = 1
		if len(trim(@cDataValue)) = 0 or (select count(EmployeeCode) from Employee where EmployeeCode = @cDataValue and CompanyID = @nCompanyId) <> 1
		select @cErrorMessage = @cErrorMessage + 'Incorrect Employee Identifier\n', @cStatus = 0

	  select @cEmployeeCode = value from #CSVtable where Row_Num = 1
	  select @nEmployeeID = ID from Employee where EmployeeCode = @cEmployeeCode and CompanyID = @nCompanyId

	  select @cDataValue = value from #CSVtable where Row_Num = 2
		if len(trim(@cDataValue)) = 0
		select @cErrorMessage = @cErrorMessage + 'Rate Number is required\n', @cStatus = 0

	  select @cDataValue = value from #CSVtable where Row_Num = 3
		if len(trim(@cDataValue)) = 0 or isdate(@cDataValue) = 0 or 
			cast(@cDataValue as datetime) <= (select max(EndDate) from EmployeeAlternateRate where EmployeeID = @nEmployeeID)
		select @cErrorMessage = @cErrorMessage + 'Invalid Start Date\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 4
		if len(trim(@cDataValue)) = 0 
			select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
		else
		if isdate(@cDataValue) = 0 or cast(@cDataValue as datetime) <= (select max(EndDate) from EmployeeAlternateRate where EmployeeID = @nEmployeeID)
		select @cErrorMessage = @cErrorMessage + 'Invalid End Date\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 5 
		if cast(@cDataValue as decimal(14,6)) not between 1 and 99999 or len(trim(@cDataValue)) = 0
		select @cErrorMessage = @cErrorMessage + 'Invalid Hourly Rate\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 6  
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select trim(str(ID,3)) from PositionType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from PositionType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Description from PositionType where CompanyID = @nCompanyId)
		select @cErrorMessage = @cErrorMessage + 'Invalid Jobs Number\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 7
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (select count(ID) from WorkerCompType where 
			Code = (left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1)) and 
			CountryStateTypeID = (select ID from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')','')) and 
			CompanyID = @nCompanyId) <> 1
		select @cErrorMessage = @cErrorMessage + 'Invalid Worker Comp Code\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 8
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (select Count(OT.ID)
			from OrganizationType OT 
					join OrganizationStructure OS on OS.ID = OT.OrganizationStructureID
			where OS.CompanyID = @nCompanyId and OrgLevel = 1 and 
				OT.Code = left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1) and
				OT.HomeStateID = (select id from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')',''))) < 1
		select @cErrorMessage = @cErrorMessage + 'Invalid Organization Level 1\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 9
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (select Count(OT.ID)
			from OrganizationType OT 
					join OrganizationStructure OS on OS.ID = OT.OrganizationStructureID
			where OS.CompanyID = @nCompanyId and OrgLevel = 2 and 
				OT.Code = left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1) and
				OT.HomeStateID = (select id from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')',''))) < 1
		select @cErrorMessage = @cErrorMessage + 'Invalid Organization Level 2\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 10
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (select Count(OT.ID)
			from OrganizationType OT 
					join OrganizationStructure OS on OS.ID = OT.OrganizationStructureID
			where OS.CompanyID = @nCompanyId and OrgLevel = 3 and 
				OT.Code = left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1) and
				OT.HomeStateID = (select id from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')',''))) < 1
		select @cErrorMessage = @cErrorMessage + 'Invalid Organization Level 3\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 11
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (select Count(OT.ID)
			from OrganizationType OT 
					join OrganizationStructure OS on OS.ID = OT.OrganizationStructureID
			where OS.CompanyID = @nCompanyId and OrgLevel = 4 and 
				OT.Code = left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1) and
				OT.HomeStateID = (select id from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')',''))) < 1
		select @cErrorMessage = @cErrorMessage + 'Invalid Organization Level 4\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	if @nGlobalError_Nbr > 0
		begin
			select @cStatus = 0
			update DataImportEventDetail 
				set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_AlternateRate', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult
		end
	else
		begin
			select @cStatus = 1
			update DataImportEventDetail 
				set CSVRowStatus = '', CSVRowNotes = 'Validation Passed', LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_AlternateRate', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult
		end

END TRY  
BEGIN CATCH  
	select @cStatus = 0
	update DataImportEventDetail 
		set CSVRowStatus = 'Failed', CSVRowNotes = 'Line: ' + CONVERT(varchar(10), ERROR_LINE()) + '. Message: ' + CONVERT(varchar(4000), ERROR_MESSAGE()), LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Compensation', LastUpdatedDate = getdate()
		where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
	select @cStatus as StatusResult
END CATCH;