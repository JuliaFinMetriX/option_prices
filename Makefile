## tell make where to look for targets and dependencies
vpath %.jl test
vpath %.ipynb notebooks

## list of targets
JL_FILES := adapt_dates_for_faster_loading.jl \
				option_data_type_performance.jl

all: tests

tests: $(JL_FILES)
	julia -e 'include("runall.jl")'

%.jl: %.ipynb
	ipython nbconvert --to python $<;
	mkdir -p test
	mv $(*F).py test/$(*F).jl

clean:
	cd test; rm *
