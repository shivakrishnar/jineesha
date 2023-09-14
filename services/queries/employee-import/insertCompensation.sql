set nocount on

declare @cTenantId				nvarchar(50)    = @TenantId
declare @nCompanyId				bigint          = @CompanyId
declare @nRowNumber				int             = @RowNumber + 1
declare @nDataImportEventId     bigint          = @DataImportEventId
declare @cCSVRow                nvarchar(max)   = @CsvRow

declare @nNbrDelimiters		int
declare @cErrorMessage		varchar(200)
select @cErrorMessage = ''
declare @nGlobalError_Nbr 	tinyint
select @nGlobalError_Nbr = 0
declare @cDataValue			nvarchar(200)
declare @cEmployeeCode		nvarchar(50)
declare @nEmployeeID		bigint
declare @dMaxDate			datetime
declare @cStatus			int
select @cStatus = 1

--declares for columns to insert
 declare @dEffectiveDate				datetime
 declare @nPayTypeID					bigint
 declare @nRate							decimal(14,6)
 declare @nPositionTypeID				bigint
 declare @nWorkerCompTypeID				bigint
 declare @nCompensationChangeReasonID	bigint
 declare @cComment						nvarchar(max)
 declare @compensationId 				int = SCOPE_IDENTITY()

	  select row_number() over(order by (select 0)) as Row_Num, * 
		into #CSVtable
		from string_split(replace(substring(@cCSVRow,2,len(@cCSVRow)-2), '","','~'), '~')

	  select @cEmployeeCode = value from #CSVtable where Row_Num = 1
	  select @nEmployeeID = ID from Employee where EmployeeCode = @cEmployeeCode and CompanyID = @nCompanyId

	  begin transaction
	  -----------
	  select @cDataValue = value from #CSVtable where Row_Num = 2
		select @dEffectiveDate = @cDataValue 

	  select @cDataValue = value from #CSVtable where Row_Num = 3
		select @nPayTypeID = (select ID from PayType where companyid = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Description)) 

	  select @cDataValue = value from #CSVtable where Row_Num = 4
		select @nRate = @cDataValue 

	  select @cDataValue = value from #CSVtable where Row_Num = 5
		select @nPositionTypeID = (select top 1 ID from PositionType where companyid = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Title))

	  select @cDataValue = value from #CSVtable where Row_Num = 6
		select @nWorkerCompTypeID = (select ID from WorkerCompType where Code = (left(@cDataValue, charindex('(', @cDataValue, charindex('(',@cDataValue))-1)) and 
			   CountryStateTypeID = (select ID from CountryStateType where StateCode = replace(replace(right(@cDataValue,4), '(',''), ')','')) and CompanyID = @nCompanyId)

	  select @cDataValue = value from #CSVtable where Row_Num = 7
		select @nCompensationChangeReasonID = (select ID from CompensationChangeReason where companyid = @nCompanyId and (@cDataValue = str(ID,3) or @cDataValue = Code or @cDataValue = Description))

	  select @cDataValue = value from #CSVtable where Row_Num = 8
		select @cComment = @cDataValue

	  insert into EmployeeCompensation (EmployeeID, EffectiveDate, PayTypeID, Rate, PositionTypeID, WorkerCompTypeID, CompensationChangeReasonID, Comment)
	  values (@nEmployeeID, @dEffectiveDate, @nPayTypeID, @nRate, @nPositionTypeID, @nWorkerCompTypeID, @nCompensationChangeReasonID, @cComment)
	  --No enddate

    if @@error <> 0
        select @nGlobalError_Nbr = @nGlobalError_Nbr + 1

	if @nGlobalError_Nbr > 0
		begin
			rollback transaction
			select @cStatus = 0
			update DataImportEventDetail 
				set CSVRowStatus = 'Failed', CSVRowNotes = 'Update Failed', LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_ADU_Employee', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult
		end
	else
		begin
			commit transaction
			select @cStatus = 1, @compensationId = SCOPE_IDENTITY()
			update DataImportEventDetail 
				set CSVRowStatus = 'Processing', CSVRowNotes = 'Update Processed', LastUserID = 0, LastProgramEvent = 'usp_DataImportEvent_ADU_Employee', LastUpdatedDate = getdate()
				where DataImportEventID = @nDataImportEventId and CSVRowNumber = @nRowNumber
			select @cStatus as StatusResult, @compensationId as CompensationIdResult
		end
