
# coding: utf-8

# - this script will be called on each startup
# - it loads the data
# - transforms strings to `Date` type
# - allows peeks into all database components

# #### Load data and convert date columns to `Date` type

# In[1]:

using DataFrames
using Dates


# In[2]:

opts = readtable("../data/rel_data/opts.csv");


# In[3]:

eltypes(opts)


# In[4]:

function convertColToDates!(df::DataFrame, col::Symbol)
    dats = Date(convert(Array, df[:, col]))
    df[col] = dats
end


# In[5]:

@time convertColToDates!(opts, :Expiry)
eltypes(opts)


# In[6]:

daxVals = readtable("../data/rel_data/daxVals.csv")
convertColToDates!(daxVals, :Date);


# In[7]:

optPrices = readtable("../data/rel_data/optPrices.csv");


# In[8]:

@time convertColToDates!(optPrices, :Date);


# In[9]:

cohortParams = readtable("../data/rel_data/cohortParams.csv");


# In[10]:

@time begin
    convertColToDates!(cohortParams, :Expiry);
    convertColToDates!(cohortParams, :Date);
end


# In[11]:

addObs = readtable("../data/rel_data/addObs.csv");
@time convertColToDates!(addObs, :Date);


# ### Display relational database components

# - `opts`: option ID together with option characterstics

# In[12]:

head(opts)


# - `daxVals`: values of underlying for each date

# In[13]:

head(daxVals)


# - `optPrices`: option prices for each day and option

# In[14]:

head(optPrices)


# - `cohortParams`: for each date time to maturity and interest rate up to expiry

# In[15]:

head(cohortParams)


# - `addObs`: for each date and option additional information other than option price

# In[16]:

head(addObs)


# ### Session info

# In[17]:

versioninfo()


# In[18]:

Pkg.status()

