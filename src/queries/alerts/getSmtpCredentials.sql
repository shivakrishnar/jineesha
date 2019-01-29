select 
	SMTPServerHost,
	SMTPServerPort,
	SMTPUsername,
	SMTPPassword,
	EmailSenderAddress = SMTPFromAddressSystem
from 
	dbo.HRnextAccount