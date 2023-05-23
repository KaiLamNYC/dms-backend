2 parts to this

1st part is the actual payload which is the cron job to a backend route to send the email

the intervals can be multiple dates or just one specific date:
(29) or (7, 14) days.

if one date is selected it just sends the checkin email and if you dont check in within 24 hours then payload will go off

so the cron job is scheduled for 7 days and then will send an email
email will contain a link to a route /checkin/randomString which will confirm the checkin and create a new cronjob with the other interval

checkin link has to contain some type of information but what type
has to be email id and other stuff to use to create another cron job or setoff the payload

if route isnt hit within 24 hours of creation/sending then payload will fire

https://youtu.be/PGPGcKBpAk8?t=17138

context
https://youtu.be/PGPGcKBpAk8?t=6120

CONTEXT API
handles the users information
name, email, all of the users email and any informaiton about the emails
ONLY NEED ONE CONTEXT

ON SUMBIT, MAKES A REQUEST USING LIB FUNCTION TO THE BACKEND SIGNIN ROUTE
IF EVERYTHING CORRECT, ROUTE TO DASHBOARD AND PASS BACK THE USERS NAME AND EMAIL TO CONTEXT

THE SERVER COMPONENT USED TO ACCESS THE BACKEND ROUTE IS LOCATED IN THE LIB FOLDER
after you make the signin request, you need to use router.push to go to the users dashboard

ALL FUNCTIONS IN THE LIB FOLDER ONLY ACCESS BACKEND MONGODB ROUTES
USE THEM TO SET STATE AND GET INFORMATION LIKE EMAILS ETC

SIGN OUT FRONTEND LIB FUNCTION WILL HIT BACKEND SIGNOUT ROUTE AND THEN CLEAR THE STATE IN CONTEXT AND ROUTER.PUSH TO HOME

NEED TO SET UP SOME MIDDLEWARE TO PROTECT THE DASHBOARD ENDPOINT
USE REQ.SESSION OR SOMETHING TO CHECK ISAUTH OR USE STATE
