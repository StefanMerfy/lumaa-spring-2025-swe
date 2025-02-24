
# Task Management App, using PostgreSQL, node.js, react+ts



# vvvv Setup Instructions vvvv

## Database Setup: 
### you will use the databaseBackup folder, ensure you have [PostgreSQL]([url](https://www.postgresql.org/download/)) installed 


## Copy database with commands: 

 run  ```CREATE DATABASE <database_name>;```  in your SQL shell to create a new database

 then run  ```psql -U <username> -d <database_name> -f <path_to_backup_file>``` to use your new database to replicate the backupfile

 ## Or copy database using pgAdmin4

 Right click on databases and click create->Database              
 ![image](https://github.com/user-attachments/assets/7e0a4d57-865c-41dc-88f7-dfcc33e37f43)
 
 You will be prompted to name your database, the name does not matter but will need to be set in your .env file later on            


Select your newly created database and select restore          
![image](https://github.com/user-attachments/assets/002b1129-d709-43ea-be19-5199ec69424e)


Once presented with the restore page, select directory for the format and for the filename click on the folder and then select the databaseBackup provided from this GitHub                  
![image](https://github.com/user-attachments/assets/c7311b92-1951-411a-8612-8e967ead8476)


Make sure the new database has been copied properly, open the dropdown for your new database and check schemas->tables, there should be two.

Now your database should be ready! Make sure your PostgreSQL server is running (if not right click it and press connect on pgAdmin4)



## Backend Setup

## .env setup

The .env file is provided for the sake of this project

The file can be found within the "node" folder of this repository, you will need to edit some of its contents                           
You will need to edit DATABASE_NAME, DATABASE_PASSWORD, you may need to edit DATABASE_USER but the default for postgreSQL is "postgres", everything else can be changed if desired but can be left as is


## Running the server
In your terminal, change directories to the "node" folder within this repository, this can be done with ```cd <path_to_nodefolder>```
then run ```npm install``` to install dependencies then run ```node index.js``` to start the server,
if the terminal responds with "server running on port ```port_number```" or a different port if you set it in your .env, then the server should be running!




## Frontend Setup

### Without killing your backend terminal, open a new terminal and make sure the directory is set to the "frontend" folder of this repository

then run ```npm install``` to  install dependencies, this may take a few moments, then run ```npm start``` to start the frontend
it may prompt you with "Something is already running on port ```<port_number>```" this will likely happen if you are running the backend at the same time
if so just press ```y``` and it will run on the next available port

Your frontend should be running now! It should open automatically in your broswer but if not the link to it should be in your terminal, ctrl+click on it and it should open
and if that doesnt work then you can go into your browser and in the url type ```http://localhost:<port_number>/```

If for some reason you want to run your frontend on a different port, you can navigate to frontend->src->Login.tsx and the port can be changed on line 3


### After all these steps the website should be running completely, feel free to signup, login, and create, edit, delete, and complete your tasks!

## Demo Video:
### https://youtu.be/U6ncr11VEpk?si=kHS7qFSPJmfxlflL


## Notes:

Since the provided database is a copy of one I did some testing in, some usernames may be taken when you try it, it shouldn't be a problem but if by some chance you pick the same usernames I did when testing, this is why you probably couldn't sign up

### Salary expectations: $2000 per month




