#%%
from re import I
from matplotlib import markers
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import copy

#%%
# Read csv
bp = pd.Series(pd.read_csv("breakpoints.csv", header=0).iloc[0, :])
t1 = pd.read_csv("treatment1 cleaned.csv", header=0, index_col=False)
t2 = pd.read_csv("treatment2 cleaned.csv", header=0, index_col=False)
t3 = pd.read_csv("treatment3 cleaned.csv", header=0, index_col=False)

#%%
# Explosion dataframes
t1_exp = (t1 > bp).astype(int)
t2_exp = (t2 > bp).astype(int)
t3_exp = (t3 > bp).astype(int)

#%%
# Merging df with treatment specified
_t1 = copy.deepcopy(t1)
_t2 = copy.deepcopy(t2)
_t3 = copy.deepcopy(t3)
_t1["treatment"] = 1
_t2["treatment"] = 2
_t3["treatment"] = 3

merged = pd.concat([_t1, _t2, _t3]).reset_index(drop=True)
print("merged", merged)

_t1_exp = copy.deepcopy(t1_exp)
_t2_exp = copy.deepcopy(t2_exp)
_t3_exp = copy.deepcopy(t3_exp)
_t1_exp["treatment"] = 1
_t2_exp["treatment"] = 2
_t3_exp["treatment"] = 3

merged_exp = pd.concat([_t1_exp, _t2_exp, _t3_exp]).reset_index(drop=True)
print("merged_exp", merged_exp)

#%%
# Aggregated statistics for number of pumps

# Create merged df with player's sum of pumps as a column
_merged = merged.copy()
_merged["Sum Pumps"] = _merged.sum(axis=1)

# Create merged df with player's sum of explosions as a column
_merged_exp = merged_exp.copy()
_merged_exp["Sum Explosions"] = _merged_exp.iloc[:, 1:12].sum(axis=1)

# Plot number of pumps and explosions by treatment
explosions_by_treatment = {
    "Treatment 1": list(_merged_exp[_merged_exp["treatment"] == 1]["Sum Explosions"]),
    "Treatment 2": list(_merged_exp[_merged_exp["treatment"] == 2]["Sum Explosions"]),
    "Treatment 3": list(_merged_exp[_merged_exp["treatment"] == 3]["Sum Explosions"])
}

total_pumps_by_treatment = {
    "Treatment 1": list(_merged[_merged["treatment"] == 1]["Sum Pumps"]),
    "Treatment 2": list(_merged[_merged["treatment"] == 2]["Sum Pumps"]),
    "Treatment 3": list(_merged[_merged["treatment"] == 3]["Sum Pumps"])
}

fig, ax1 = plt.subplots(figsize=(9,6))
box_param = dict(widths=0.2, patch_artist=True,medianprops=dict(color='black'), showmeans=True, meanline=True)

space = 0.15
boxp = ax1.boxplot(total_pumps_by_treatment.values(), positions=np.arange(3)-space,
            boxprops=dict(facecolor='tab:blue'), **box_param)

ax2 = ax1.twinx()
ax2.boxplot(explosions_by_treatment.values(), positions=np.arange(3)+space,
            boxprops=dict(facecolor='tab:orange'), **box_param)

labelsize = 12
ax1.set_xticks(np.arange(3))
ax1.set_xticklabels(total_pumps_by_treatment.keys())
ax1.tick_params(axis='x', labelsize=labelsize)

yticks_fmt = dict(axis='y', labelsize=labelsize)
ax1.tick_params(colors='tab:blue', **yticks_fmt)
ax2.tick_params(colors='tab:orange', **yticks_fmt)
ax2.set_ylim([0, 12])

label_fmt = dict(size=12, labelpad=15)
ax1.set_ylabel('Pumps', color='tab:blue', **label_fmt)
ax2.set_ylabel('Explosions', color='tab:orange', **label_fmt)
plt.legend([boxp['medians'][0], boxp['means'][0]], ['median', 'mean'])
plt.title("Number of Pumps and Explosions by Treatment")

plt.show()

#########################################################
# plt.figure(figsize=(10, 5))
# plt.boxplot(
#     total_pumps_by_treatment.values(),
#     labels=total_pumps_by_treatment.keys(),
#     meanline=True,
#     showmeans=True
# )
# plt.ylabel("Pumps")
# plt.title("Number of Pumps by Treatment")
# plt.show()
##########################################################
# Average and std pumps by balloon by treatment
avg_pumps_by_balloon = merged.groupby("treatment").mean()
std_pumps_by_balloon = merged.groupby("treatment").std()

# Plot number of pumps by treatment by balloon
plt.figure(figsize=(10, 5))
plt.errorbar(
    x=range(1, 13),
    y=avg_pumps_by_balloon.iloc[0, :],
    yerr=std_pumps_by_balloon.iloc[0, :],
    marker="s",
    barsabove=True,
    capsize=3,
    ls="none",
    label="Treatment 1",
    alpha=1
)
plt.errorbar(
    x=range(1, 13),
    y=avg_pumps_by_balloon.iloc[1, :],
    yerr=std_pumps_by_balloon.iloc[1, :],
    marker="s",
    barsabove=True,
    capsize=3,
    ls="none",
    label="Treatment 2",
    alpha=1
)
plt.errorbar(
    x=range(1, 13),
    y=avg_pumps_by_balloon.iloc[2, :],
    yerr=std_pumps_by_balloon.iloc[2, :],
    marker="s",
    barsabove=True,
    capsize=3,
    ls="none",
    label="Treatment 3",
    alpha=1
)
plt.plot(
    range(1, 13),
    bp.to_list(),
    "ro--",
    label="Breakpoints"
)
plt.legend()
plt.xticks(np.arange(1, 13, 1.0))
plt.ylabel("Number of pumps")
plt.xlabel("Balloon number")
plt.title("Average Number of Pumps by Balloon by Treatment +/-1SD")
plt.show()

#%%
# Aggregated statistics for number of explosions

# Average explosions by balloon for ALL participants
avg_explosions_by_balloon_all = merged_exp.mean()
print("avg_explosions_by_balloon_all", avg_explosions_by_balloon_all)

# Average explosions by balloon by treatment
avg_explosions_by_balloon = merged_exp.groupby("treatment").mean()
print("avg_explosions_by_balloon", avg_explosions_by_balloon)

# Average number of explosions by treatment
avg_explosions = avg_explosions_by_balloon.sum(axis=1)
print("avg_explosions", avg_explosions)

# Plot explosion percentage of balloons
avg_explosions_by_balloon_pct = avg_explosions_by_balloon * 100
fig = plt.figure(figsize=(10, 5))
ax = fig.add_subplot(111)
ax.plot(
    range(1, 13),
    avg_explosions_by_balloon_pct.iloc[0, :],
    marker="s",
    label="Treatment 1",
    ls="-",
    lw=1,
    alpha=1,
)
ax.plot(
    range(1, 13),
    avg_explosions_by_balloon_pct.iloc[1, :],
    marker="s",
    label="Treatment 2",
    ls="-",
    lw=1,
    alpha=1,
)
ax.plot(
    range(1, 13),
    avg_explosions_by_balloon_pct.iloc[2, :],
    marker="s",
    label="Treatment 3",
    ls="-",
    lw=1,
    alpha=1,
)
ax2 = ax.twinx()
ax2.plot(
    range(1, 13),
    bp.to_list(),
    "ro--",
    label="Breakpoints"
)
ax.plot(
    np.nan,
    "s--",
    label="Breakpoints"
)
ax.legend()
plt.xticks(np.arange(1, 13, 1.0))
ax.set_xlabel("Balloon number")
ax.set_ylabel("Exploded by % players")
ax2.set_ylabel("Breakpoints")
plt.xlabel("Balloon number")
plt.title("Explosion Percentage of Balloons")
plt.show()

#%%
# 1. Explore people's behavior after exploding balloons (i to i + n)

# Helper function that returns various statistics about change in pumps after explosion
def change_after_explode(n=1):
    pumps = [t1, t2, t3]
    exps = [t1_exp, t2_exp, t3_exp]

    # contains the AVERAGE and STD change for each balloon by treatment (each row is a treatment)
    avg_chg_after_exp_by_balloon = pd.DataFrame().reindex_like(avg_pumps_by_balloon)
    std_chg_after_exp_by_balloon = pd.DataFrame().reindex_like(avg_pumps_by_balloon)
    
    raw_changes = {"Treatment 1": [], "Treatment 2": [], "Treatment 3": []} # contains raw changes after explosion (by treatment)

    # iterate over each treatment's pump and exp df
    for idx, (pump, exp) in enumerate(zip(pumps, exps)):
        # contains the changes for each balloon by player (each row is a player) - specific to treatment
        change_after_exp = pd.DataFrame().reindex_like(pump)

        # locations of explosions for this treatment
        exp_locs = exp[exp == 1].stack().index.tolist()

        # iterate over each location to find change
        for i in exp_locs:
            balloon_num = int(i[1][1:]) # remove "b"

            if balloon_num <= len(pump.columns) - n:
                i_plus_n = (i[0], f"b{balloon_num + n}")
                if i_plus_n not in exp_locs:

                    # compute change and store
                    change = pump.loc[i_plus_n] - pump.loc[i]
                    change_after_exp.loc[i] = change
                    raw_changes[f"Treatment {idx + 1}"].append(change)

        avg_chg_after_exp_by_balloon.loc[idx + 1] = change_after_exp.mean(skipna=True)
        std_chg_after_exp_by_balloon.loc[idx + 1] = change_after_exp.std(skipna=True)
        print("BRUH", len(raw_changes), raw_changes)

    return avg_chg_after_exp_by_balloon, std_chg_after_exp_by_balloon, raw_changes

# Plot change in # of Pumps {n} Balloons After Explosion boxplot
def plot_change_after_explode(n=1):
    avg_change_after_explode_by_balloon_by_treatment, std_change_after_explode_by_balloon_by_treatment, raw_changes = change_after_explode(n)
    # print("avg_change_after_explode_by_balloon_by_treatment", avg_change_after_explode_by_balloon_by_treatment)
    plt.figure(figsize=(10, 5))
    boxp = plt.boxplot(raw_changes.values(), labels=raw_changes.keys(), showmeans=True, meanline=True)
    plt.legend([boxp['medians'][0], boxp['means'][0]], ['median', 'mean'])
    plt.ylabel("Change in pumps")
    if n == 1:
        plt.title(f"Change in # of Pumps {n} Balloon After Explosion")
    else:
        plt.title(f"Change in # of Pumps {n} Balloons After Explosion")
    plt.show()

    return avg_change_after_explode_by_balloon_by_treatment, std_change_after_explode_by_balloon_by_treatment

# Average and standard deviation change after explosion by balloon
n = 1
avg, std = plot_change_after_explode(n=n)

def plot_change_after_explode_by_balloon(avg, std):
    # Need to shift right so that the nth column shows change in num pumps from n-1 to n
    avg = avg.shift(axis=1)
    std = std.shift(axis=1)

    # Plot change in # of Pumps {n} Balloons After Explosion BY BALLOON
    plt.figure(figsize=(6, 5))
    plt.errorbar(
        x=range(1, 13),
        y=avg.iloc[0, :],
        yerr=std.iloc[0, :],
        marker="s",
        barsabove=True,
        capsize=3,
        ls="none",
        label="Treatment 1",
        alpha=1
    )
    plt.errorbar(
        x=range(1, 13),
        y=avg.iloc[1, :],
        yerr=std.iloc[1, :],
        marker="s",
        barsabove=True,
        capsize=3,
        ls="none",
        label="Treatment 2",
        alpha=1
    )
    plt.errorbar(
        x=range(1, 13),
        y=avg.iloc[2, :],
        yerr=std.iloc[2, :],
        marker="s",
        barsabove=True,
        capsize=3,
        ls="none",
        label="Treatment 3",
        alpha=1
    )
    plt.legend()
    plt.xticks(np.arange(1, 13, 1.0))
    plt.ylabel("Change in number of pumps")
    plt.xlabel("Balloon number")
    if n == 1:
        plt.title(f"Average Change in # of Pumps {n} Balloon After Explosion By Balloon +/-1SD")
    else:
        plt.title(f"Average Change in # of Pumps {n} Balloons After Explosion By Balloon +/-1SD")
    plt.show()

plot_change_after_explode_by_balloon(avg, std)
#%%
# 2. Explore people's behavior after not exploding balloon i (and imposing that i + 1 is not exploded)
# Helper function that returns various statistics about change in pumps after non-explosion
def change_after_not_explode(n=1):
    pumps = [t1, t2, t3]
    exps = [t1_exp, t2_exp, t3_exp]

    # contains the AVERAGE and STD change for each balloon by treatment (each row is a treatment)
    avg_chg_after_non_exp_by_balloon = pd.DataFrame().reindex_like(avg_pumps_by_balloon)
    std_chg_after_non_exp_by_balloon = pd.DataFrame().reindex_like(avg_pumps_by_balloon)
    
    raw_changes = {"Treatment 1": [], "Treatment 2": [], "Treatment 3": []} # contains raw changes after non-explosion (by treatment)

    # iterate over each treatment's pump and exp df
    for idx, (pump, exp) in enumerate(zip(pumps, exps)):
        # contains the changes for each balloon by player (each row is a player) - specific to treatment
        change_after_non_exp = pd.DataFrame().reindex_like(pump)

        # locations of explosions and non for this treatment
        exp_locs = exp[exp == 1].stack().index.tolist()
        non_exp_locs = exp[exp == 0].stack().index.tolist()

        # iterate over each location to find change
        for i in non_exp_locs:
            balloon_num = int(i[1][1:]) # remove "b"

            if balloon_num <= len(pump.columns) - n:
                i_plus_n = (i[0], f"b{balloon_num + n}")

                # ensure i+n balloon was not exploded
                if i_plus_n not in exp_locs:
                    # compute change and store
                    change = pump.loc[i_plus_n] - pump.loc[i]
                    change_after_non_exp.loc[i] = change
                    raw_changes[f"Treatment {idx + 1}"].append(change)

        avg_chg_after_non_exp_by_balloon.loc[idx + 1] = change_after_non_exp.mean(skipna=True)
        std_chg_after_non_exp_by_balloon.loc[idx + 1] = change_after_non_exp.std(skipna=True)

    return avg_chg_after_non_exp_by_balloon, std_chg_after_non_exp_by_balloon, raw_changes

# Plot change in # of Pumps {n} Balloons After Explosion boxplot
def plot_change_after_non_explode(n=1):
    avg_change_after_non_explode_by_balloon_by_treatment, std_change_after_non_explode_by_balloon_by_treatment, raw_changes = change_after_not_explode(n)
    plt.figure(figsize=(10, 5))
    boxp = plt.boxplot(raw_changes.values(), labels=raw_changes.keys(), showmeans=True, meanline=True)
    plt.legend([boxp['medians'][0], boxp['means'][0]], ['median', 'mean'])
    plt.ylabel("Change in pumps")
    if n == 1:
        plt.title(f"Change in # of Pumps {n} Balloon After Non-Explosion")
    else:
        plt.title(f"Change in # of Pumps {n} Balloons After Non-Explosion")
    plt.show()

    return avg_change_after_non_explode_by_balloon_by_treatment, std_change_after_non_explode_by_balloon_by_treatment

# Average and standard deviation change after explosion by balloon
n = 1
avg, std = plot_change_after_non_explode(n=n)

def plot_change_after_non_explode_by_balloon(avg, std):
    # Need to shift right so that the nth column shows change in num pumps from n-1 to n
    avg = avg.shift(axis=1)
    std = std.shift(axis=1)

    # Plot change in # of Pumps {n} Balloons After Explosion BY BALLOON
    plt.figure(figsize=(6, 5))
    plt.errorbar(
        x=range(1, 13),
        y=avg.iloc[0, :],
        yerr=std.iloc[0, :],
        marker="s",
        barsabove=True,
        capsize=3,
        ls="none",
        label="Treatment 1",
        alpha=1
    )
    plt.errorbar(
        x=range(1, 13),
        y=avg.iloc[1, :],
        yerr=std.iloc[1, :],
        marker="s",
        barsabove=True,
        capsize=3,
        ls="none",
        label="Treatment 2",
        alpha=1
    )
    plt.errorbar(
        x=range(1, 13),
        y=avg.iloc[2, :],
        yerr=std.iloc[2, :],
        marker="s",
        barsabove=True,
        capsize=3,
        ls="none",
        label="Treatment 3",
        alpha=1
    )
    plt.legend()
    plt.xticks(np.arange(1, 13, 1.0))
    plt.ylabel("Change in number of pumps")
    plt.xlabel("Balloon number")
    if n == 1:
        plt.title(f"Average Change in # of Pumps {n} Balloon After Non-Explosion By Balloon +/-1SD")
    else:
        plt.title(f"Average Change in # of Pumps {n} Balloons After Non-Explosion By Balloon +/-1SD")
    plt.show()

plot_change_after_non_explode_by_balloon(avg, std)

#%%
"""
Money earned
"""
pumps = [t1, t2, t3]
exps = [t1_exp, t2_exp, t3_exp]
assert t1.shape == t1_exp.shape
assert t2.shape == t2_exp.shape
assert t3.shape == t3_exp.shape

earnings_by_treatment = {"Treatment 1": [], "Treatment 2": [], "Treatment 3": []}

for idx, (pump, exp) in enumerate(zip(pumps, exps)):
    earnings = pump * 0.05
    expl_locs = exp[exp == 1].stack().index.tolist()
    treatment = idx + 1
    for loc in expl_locs:
        if treatment == 1:
            earnings.loc[loc] = 0
        if treatment == 2:
            earnings.loc[loc] = -0.2
        if treatment == 3:
            earnings.loc[loc] = -0.05 * pump.loc[loc]
    
    earnings["Earnings"] = earnings.sum(axis=1) + 5
    earnings_by_treatment[f"Treatment {treatment}"] = earnings["Earnings"].to_list()

plt.boxplot(earnings_by_treatment.values(), labels=earnings_by_treatment.keys(), showmeans=True, meanline=True)
plt.ylabel("Earnings ($)")
plt.title("Final Earnings by Treatment")
plt.show()

# %%
"""
Surplus per balloon
"""
surplus_merged = (bp - (merged.loc[:, merged.columns != 'treatment'])).replace(-1, np.nan)
surplus_merged["treatment"] = merged["treatment"]
surplus = surplus_merged.groupby("treatment").mean()
surplus["Average"] = surplus.mean(axis=1)
print("surplus", surplus)
# surplus.to_csv("surplus.csv")
#%%
# Duration of games
duration = pd.read_csv("duration.csv", header=0)
plt.figure(figsize=(8, 5))
boxp = plt.boxplot(duration["Duration (in seconds)"], labels=[""], showmeans=True, meanline=True)
plt.legend([boxp['medians'][0], boxp['means'][0]], [f'median: {int(np.median(duration["Duration (in seconds)"]))}', f'mean: {int(np.mean(duration["Duration (in seconds)"]))}'])
plt.ylabel("Seconds")
plt.title("Duration of Qualtrics Survey Completion")

# %%
