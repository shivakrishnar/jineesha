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
		from string_split(replace(substring(@cCSVRow,2,len(@cCSVRow)-2), '","','~'), '~')

	  select @cDataValue = value from #CSVtable where Row_Num = 1
	  if len(trim(@cDataValue)) = 0 or (select count(EmployeeCode) from Employee where EmployeeCode = @cDataValue and CompanyID = @nCompanyId) <> 1
		select @cErrorMessage = @cErrorMessage + 'Incorrect Employee Identifier\n', @cStatus = 0

	  select @cEmployeeCode = value from #CSVtable where Row_Num = 1
	  select @nEmployeeID = ID from Employee where EmployeeCode = @cEmployeeCode and CompanyID = @nCompanyId

	  select @cDataValue = value from #CSVtable where Row_Num = 2
		if len(trim(@cDataValue)) = 0 or isdate(@cDataValue) = 0 or 
			cast(@cDataValue as datetime) <= (select max(EffectiveDate) from EmployeeCompensation where EmployeeID = @nEmployeeID)
		select @cErrorMessage = @cErrorMessage + 'Invalid Effective Date\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 3
		if (@cDataValue not in (select Code from PayType where CompanyID = @nCompanyId)) or
		   len(trim(@cDataValue)) = 0
		select @cErrorMessage = @cErrorMessage + 'Invalid Pay Type\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 4 
		if len(trim(@cDataValue)) = 0
			select @cErrorMessage = @cErrorMessage + 'Rate is mandatory\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
		else if cast(@cDataValue as decimal) <= 0
			select @cErrorMessage = @cErrorMessage + 'Invalid Rate\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 5  
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select trim(str(ID,3)) from PositionType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from PositionType where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Description from PositionType where CompanyID = @nCompanyId)
		select @cErrorMessage = @cErrorMessage + 'Invalid Jobs Number\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 6
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
	  	if @cDataValue not like '%(%)%'
			select @cErrorMessage = @cErrorMessage + 'Invalid Worker Comp Code\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1
		else 
			if (select count(ID) from WorkerCompType where 
				Code = (left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1)) and 
				CountryStateTypeID = (select ID from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')','')) and 
				CompanyID = @nCompanyId) <> 1
				select @cErrorMessage = @cErrorMessage + 'Invalid Worker Comp Code\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 7
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if @cDataValue not in (select trim(str(ID,3)) from CompensationChangeReason where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select Code from CompensationChangeReason where CompanyID = @nCompanyId) and 
		   @cDataValue not in (select isnull(Description,'') from CompensationChangeReason where CompanyID = @nCompanyId)  
		select @cErrorMessage = @cErrorMessage + 'Invalid Change Reason\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	  select @cDataValue = value from #CSVtable where Row_Num = 8
	  if len(trim(@cDataValue)) = 0
		select @cColumnsToUpdate = @cColumnsToUpdate + 'N'
	  else
		if len(trim(@cDataValue)) > 4000
		select @cErrorMessage = @cErrorMessage + 'Invalid Comment\n', @cStatus = 0, @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	if @nGlobalError_Nbr > 0
		begin
			select @cStatus = 0
			update DataImportEventDetail 
				set CSVRowStatus = 'Failed', CSVRowNotes = @cErrorMessage, LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Compensation', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult
		end
	else
		begin
			select @cStatus = 1
			update DataImportEventDetail 
				set CSVRowNotes = 'Validation Passed', LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_Validate_Compensation', LastUpdatedDate = getdate()
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