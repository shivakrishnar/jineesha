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
select  @cStatus = 1

BEGIN TRY 

	  select row_number() over(order by (select 0)) as Row_Num, * 
		into #CSVtable
		from string_split(replace(substring(@cCSVRow,2,len(@cCSVRow)-2), '","','~'), '~') 

	  select @cDataValue = value from #CSVtable where Row_Num = 1 
	  if len(trim(@cDataValue)) = 0 or (select count(EmployeeCode) from Employee where EmployeeCode = @cDataValue and CompanyID = @nCompanyId) <> 1
		select @cErrorMessage = @cErrorMessage + 'Incorrect Employee Identifier, please check for missing leading zeros\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 2
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if isdate(@cDataValue) = 0 or cast(@cDataValue as date) > getdate()
		  select @cErrorMessage = @cErrorMessage + 'Invalid BirthDate\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 3 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if isnumeric(@cDataValue) = 0  
		  select @cErrorMessage = @cErrorMessage + 'Invalid Time Clock Number\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 4 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if len(trim(@cDataValue)) < 10 or @cDataValue not like '%@%'
		  select @cErrorMessage = @cErrorMessage + 'Invalid eMail\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 5 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]' and 
		   @cDataValue not like '[0-9][0-9][0-9]-[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]' and
		   @cDataValue not like '([0-9][0-9][0-9])[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]' and
		   @cDataValue not like '[0-9][0-9][0-9].[0-9][0-9][0-9].[0-9][0-9][0-9][0-9]' 
		  select @cErrorMessage = @cErrorMessage + 'Invalid Home Phone\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 6 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]' and 
		   @cDataValue not like '[0-9][0-9][0-9]-[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]' and
		   @cDataValue not like '([0-9][0-9][0-9])[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]' and
		   @cDataValue not like '[0-9][0-9][0-9].[0-9][0-9][0-9].[0-9][0-9][0-9][0-9]' --or  
		  select @cErrorMessage = @cErrorMessage + 'Invalid Work Phone\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 7 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not like '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]' and 
		   @cDataValue not like '[0-9][0-9][0-9]-[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]' and
		   @cDataValue not like '([0-9][0-9][0-9])[0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]' and
		   @cDataValue not like '[0-9][0-9][0-9].[0-9][0-9][0-9].[0-9][0-9][0-9][0-9]' --or
		  select @cErrorMessage = @cErrorMessage + 'Invalid Cell Phone\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 8
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else	 
		if @cDataValue not in (select Code from GenderType) or len(trim(@cDataValue)) = 0
			select @cErrorMessage = @cErrorMessage + 'Invalid Gender\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 9 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select str(ID,2) from EthnicityType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from EthnicityType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select isnull(Description,'') from EthnicityType where CompanyID = @nCompanyId)
		  select @cErrorMessage = @cErrorMessage + 'Invalid Ethnicity\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 10
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select str(ID,1) from EducationLevelType) and 
		   @cDataValue not in (select Code from EducationLevelType) and 
		   @cDataValue not in (select isnull(Description,'') from EducationLevelType)
		  select @cErrorMessage = @cErrorMessage + 'Invalid Education Level\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 11
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not between 0 and 1
		  select @cErrorMessage = @cErrorMessage + 'Invalid Tobacco User\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 12
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not between 0 and 1
		  select @cErrorMessage = @cErrorMessage + 'Invalid Disabled\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 13 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in ('Declined to disclose - N/A' , 'No' , 'Yes')
		  select @cErrorMessage = @cErrorMessage + 'Invalid Military Reserve\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 14 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in ('Declined to disclose - N/A' , 'No' , 'Yes')
		  select @cErrorMessage = @cErrorMessage + 'Invalid Veteran\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 15 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if len(trim(@cDataValue)) > 100 
		  select @cErrorMessage = @cErrorMessage + 'Invalid Memo1\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 16 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if len(trim(@cDataValue)) > 100 
		  select @cErrorMessage = @cErrorMessage + 'Invalid Memo2\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 17 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if len(trim(@cDataValue)) > 100 
		  select @cErrorMessage = @cErrorMessage + 'Invalid Memo3\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 18 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (@cDataValue not in (select trim(str(ID,3)) from FrequencyType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from FrequencyType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select isnull(Description,'') from FrequencyType where CompanyID = @nCompanyId))
		   or (select count(*) from FrequencyType where (@cDataValue = trim(str(ID,3)) or @cDataValue = Code or @cDataValue = isnull(Description,'')) and CompanyID = @nCompanyId) <> 1
		  select @cErrorMessage = @cErrorMessage + 'Invalid Pay Frequency\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 19 
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if cast(@cDataValue as decimal(14,6)) not between 1 and 2080
		  select @cErrorMessage = @cErrorMessage + 'Invalid Standard Payroll Hours\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 20
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in ('E','N','NA')
		  select @cErrorMessage = @cErrorMessage + 'Invalid FLSA Classification\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 21
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select trim(str(ID,3)) from PositionType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from PositionType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Title from PositionType where CompanyID = @nCompanyId)
		  select @cErrorMessage = @cErrorMessage + 'Invalid Position\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 22
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (select count(ID) from Employee where EmployeeCode = @cDataValue and CompanyID = @nCompanyId) <> 1
		  select @cErrorMessage = @cErrorMessage + 'Invalid Reports To 1\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 23
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (select count(ID) from Employee where EmployeeCode = @cDataValue and CompanyID = @nCompanyId) <> 1
		  select @cErrorMessage = @cErrorMessage + 'Invalid Reports To 2\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 24
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if (select count(ID) from Employee where EmployeeCode = @cDataValue and CompanyID = @nCompanyId) <> 1
		  select @cErrorMessage = @cErrorMessage + 'Invalid Reports To 3\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 25
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if isnumeric(@cDataValue) = 0
		  select @cErrorMessage = @cErrorMessage + 'Invalid Supervisor(SC)\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 26
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select trim(str(ID,2)) from BenefitClass where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from BenefitClass where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select isnull(Description,'') from BenefitClass where CompanyID = @nCompanyId)
		  select @cErrorMessage = @cErrorMessage + 'Invalid Benefit Class/Eligibility Group\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 27
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select trim(str(ID,2)) from EEOType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from EEOType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select isnull(Description,'') from EEOType where CompanyID = @nCompanyId)
		  select @cErrorMessage = @cErrorMessage + 'Invalid EEO Category\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 28
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
	  	if @cDataValue not like '%(%)%'
			select @cErrorMessage = @cErrorMessage + 'Invalid Worker Comp Code\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
		else 
			if (select count(ID) from WorkerCompType 
				where 
					Code = (left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1)) and 
					CountryStateTypeID = (select ID from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')','')) and 
					CompanyID = @nCompanyId) <> 1
			select @cErrorMessage = @cErrorMessage + 'Invalid Worker Comp Code\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 29
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select trim(str(ID,3)) from PositionOrganizationChangeReason where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from PositionOrganizationChangeReason where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select isnull(Description,'') from PositionOrganizationChangeReason where CompanyID = @nCompanyId)  
		  select @cErrorMessage = @cErrorMessage + 'Invalid Change Reason\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 30
		if len(trim(@cDataValue)) = 0
		select @cErrorMessage = @cErrorMessage + 'Company Code is required\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 32
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if len(trim(@cDataValue)) > 4000
		  select @cErrorMessage = @cErrorMessage + 'Invalid Comment\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	if @nGlobalError_Nbr > 0
		begin
			select @cStatus = 0
			update DataImportEventDetail 
				set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult
		end
	else
		begin
			select @cStatus = 1
			update DataImportEventDetail 
				set CSVRowStatus = 'Validation Passed', CSVRowNotes = '', LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Employee', LastUpdatedDate = getdate()
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