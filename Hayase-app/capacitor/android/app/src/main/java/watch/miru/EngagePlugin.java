package app.hayase;

import android.net.Uri;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PluginResult;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.engage.common.datamodel.AccountProfile;
import com.google.android.engage.common.datamodel.ContentAvailability;
import com.google.android.engage.common.datamodel.ContinuationCluster;
import com.google.android.engage.common.datamodel.DisplayTimeWindow;
import com.google.android.engage.common.datamodel.Entity;
import com.google.android.engage.common.datamodel.FeaturedCluster;
import com.google.android.engage.common.datamodel.Image;
import com.google.android.engage.common.datamodel.PlatformSpecificUri;
import com.google.android.engage.common.datamodel.RecommendationCluster;
import com.google.android.engage.service.AppEngagePublishClient;
import com.google.android.engage.service.PublishContinuationClusterRequest;
import com.google.android.engage.service.PublishFeaturedClusterRequest;
import com.google.android.engage.service.PublishRecommendationClustersRequest;
import com.google.android.engage.video.datamodel.MovieEntity;
import com.google.android.engage.video.datamodel.RatingSystem;
import com.google.android.engage.video.datamodel.TvEpisodeEntity;
import com.google.android.engage.video.datamodel.TvSeasonEntity;
import com.google.android.engage.video.datamodel.TvShowEntity;

import org.json.JSONException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "Engage")
public class EngagePlugin extends Plugin {
  AppEngagePublishClient client = null;

  private static <T, R> List<R> mapToEngage(List<T> list) {
    if (list == null) {
      return new ArrayList<>();
    }
    List<R> result = new ArrayList<>();
    for (T item : list) {
      if (item instanceof EngageAvailabilityWindow) {
        result.add((R) ((EngageAvailabilityWindow) item).asEngage());
      } else if (item instanceof EngageUri) {
        result.add((R) ((EngageUri) item).asEngage());
      } else if (item instanceof EngageImage) {
        result.add((R) ((EngageImage) item).asEngage());
      } else if (item instanceof EngageContentRating) {
        result.add((R) ((EngageContentRating) item).asEngage());
      }
    }
    return result;
  }

  @Override
  public void load() {
    client = new AppEngagePublishClient(this.getContext());
  }

  @PluginMethod
  public void isServiceAvailable(PluginCall call) {
    client.isServiceAvailable().addOnCompleteListener(task -> {
      if (task.isSuccessful()) {
        call.successCallback(new PluginResult(new JSObject().put("result", task.getResult())));
      } else {
        call.reject("IPC call failed");
      }
    });
  }

  @PluginMethod
  public void publishContinuationCluster(PluginCall call) {
    ObjectMapper mapper = new ObjectMapper();

    try {
      ContinuationClusterSchema cluster = mapper.readValue(call.getData().toString(), ContinuationClusterSchema.class);
      client.publishContinuationCluster(
          new PublishContinuationClusterRequest.Builder().setContinuationCluster(cluster.asEngage()).build());
      call.successCallback(new PluginResult());
    } catch (JsonProcessingException e) {
      call.reject("Failed processing JSON", e);
    }
  }

  @PluginMethod
  public void publishRecommendationCluster(PluginCall call) {
    ObjectMapper mapper = new ObjectMapper();

    try {
      EngageAccount account = mapper.readValue(call.getData().getJSObject("accountProfile").toString(),
          EngageAccount.class);
      List<RecommendationClusterSchema> cluster = mapper.readValue(call.getData().getJSONArray("clusters").toString(),
          new TypeReference<>() {
          });
      PublishRecommendationClustersRequest.Builder builder = new PublishRecommendationClustersRequest.Builder()
          .setAccountProfile(account.asEngage());

      for (RecommendationClusterSchema clusterSchema : cluster) {
        builder.addRecommendationCluster(clusterSchema.asEngage());
      }

      client.publishRecommendationClusters(builder.build());
      call.successCallback(new PluginResult());
    } catch (JsonProcessingException | JSONException e) {
      call.reject("Failed processing JSON", e);
    }
  }

  @PluginMethod
  public void publishFeaturedCluster(PluginCall call) {
    ObjectMapper mapper = new ObjectMapper();

    try {
      FeaturedClusterSchema cluster = mapper.readValue(call.getData().toString(), FeaturedClusterSchema.class);
      client.publishFeaturedCluster(
          new PublishFeaturedClusterRequest.Builder().setFeaturedCluster(cluster.asEngage()).build());
      call.successCallback(new PluginResult());
    } catch (JsonProcessingException e) {
      call.reject("Failed processing JSON", e);
    }
  }

  @PluginMethod
  public void deleteContinuationCluster(PluginCall call) {
    client.deleteContinuationCluster();
    call.successCallback(new PluginResult());
  }

  @PluginMethod
  public void deleteFeaturedCluster(PluginCall call) {
    client.deleteFeaturedCluster();
    call.successCallback(new PluginResult());
  }

  @PluginMethod
  public void deleteRecommendationClusters(PluginCall call) {
    client.deleteRecommendationsClusters();
    call.successCallback(new PluginResult());
  }

  private static class ContinuationClusterSchema {
    public EngageAccount accountProfile;
    public List<EngageEntry> entries;

    protected ContinuationCluster asEngage() {
      ContinuationCluster.Builder builder = new ContinuationCluster.Builder();
      builder.setAccountProfile(accountProfile.asEngage());

      for (EngageEntry entry : entries) {
        builder.addEntity(entry.asEngage());
      }

      return builder.build();
    }
  }

  private static class RecommendationClusterSchema {
    public List<EngageEntry> entries;
    public String title;
    public String subtitle;
    public String actionText;
    public String actionUri;

    protected RecommendationCluster asEngage() {
      RecommendationCluster.Builder builder = new RecommendationCluster.Builder()
          .setTitle(title)
          .setSubtitle(subtitle)
          .setActionText(actionText);

      if (actionUri != null)
        builder.setActionUri(Uri.parse(actionUri));

      for (EngageEntry entry : entries) {
        builder.addEntity(entry.asEngage());
      }

      return builder.build();
    }
  }

  private static class FeaturedClusterSchema {
    public List<EngageEntry> entries;

    protected FeaturedCluster asEngage() {
      FeaturedCluster.Builder builder = new FeaturedCluster.Builder();

      for (EngageEntry entry : entries) {
        builder.addEntity(entry.asEngage());
      }

      return builder.build();
    }
  }

  private static class EngageAccount {
    public String accoundId;
    public String profileId;
    public String locale;

    protected AccountProfile asEngage() {
      return new AccountProfile.Builder()
          .setAccountId(accoundId)
          .setProfileId(profileId)
          .setLocale(locale)
          .build();
    }
  }

  private static class EngageUri {
    public String uri;
    public int type;

    protected PlatformSpecificUri asEngage() {
      return new PlatformSpecificUri.Builder()
          .setActionUri(Uri.parse(uri))
          .setPlatformType(type)
          .build();
    }
  }

  private static class EngageImage {
    public String uri;
    public int width;
    public int height;

    protected Image asEngage() {
      return new Image.Builder()
          .setImageUri(Uri.parse(uri))
          .setImageWidthInPixel(width)
          .setImageHeightInPixel(height)
          .build();
    }
  }

  private static class EngageAvailabilityWindow {
    long startTimestampMillis;
    long endTimestampMillis;

    protected DisplayTimeWindow asEngage() {
      return new DisplayTimeWindow.Builder()
          .setStartTimestampMillis(startTimestampMillis)
          .setEndTimestampMillis(endTimestampMillis)
          .build();
    }
  }

  private static class EngageContentRating {
    public String rating;
    public String agencyName;

    protected RatingSystem asEngage() {
      return new RatingSystem.Builder()
          .setRating(rating)
          .setAgencyName(agencyName)
          .build();
    }
  }

  @JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
  @JsonSubTypes({
      @JsonSubTypes.Type(value = EngageTvEpisodeEntry.class, name = "tv_episode"),
      @JsonSubTypes.Type(value = EngageTvSeasonEntry.class, name = "tv_season"),
      @JsonSubTypes.Type(value = EngageTvShowEntry.class, name = "tv_show"),
      @JsonSubTypes.Type(value = EngageMovieEntry.class, name = "movie")
  })
  private abstract static class EngageEntry {
    protected abstract Entity asEngage();
  }

  private static class EngageTvEpisodeEntry extends EngageEntry {
    public List<EngageAvailabilityWindow> availabilityTimeWindows;
    public List<EngageContentRating> contentRatings;
    public String infoPageUri;
    public String entityId;
    public int watchNextType;
    public boolean downloadedOnDevice;
    public boolean isNextEpisodeAvailable;
    public String name; // required
    public List<EngageUri> platformSpecificPlaybackUris; // required
    public List<EngageImage> posterImages; // required
    public long lastEngagementTimeMillis;
    public int durationMillis; // required
    public int lastPlayBackPositionTimeMillis;
    public int episodeNumber;
    public String seasonNumber;
    public String showTitle;
    public String seasonTitle;
    public long airDateEpochMillis; // required
    public List<String> genres; // required

    protected TvEpisodeEntity asEngage() {
      return new TvEpisodeEntity.Builder()
          .addAllAvailabilityTimeWindows(availabilityTimeWindows == null ? Collections.<DisplayTimeWindow>emptyList()
              : EngagePlugin.<EngageAvailabilityWindow, DisplayTimeWindow>mapToEngage(availabilityTimeWindows))
          .setInfoPageUri(infoPageUri == null ? null : Uri.parse(infoPageUri))
          .setWatchNextType(watchNextType)
          .setEntityId(entityId)
          .setDownloadedOnDevice(downloadedOnDevice)
          .setIsNextEpisodeAvailable(isNextEpisodeAvailable)
          .setName(name)
          .addPlatformSpecificPlaybackUris(
              EngagePlugin.<EngageUri, PlatformSpecificUri>mapToEngage(platformSpecificPlaybackUris))
          .addPosterImages(EngagePlugin.<EngageImage, Image>mapToEngage(posterImages))
          .setLastEngagementTimeMillis(lastEngagementTimeMillis)
          .setDurationMillis(durationMillis)
          .setLastPlayBackPositionTimeMillis(lastPlayBackPositionTimeMillis)
          .setEpisodeNumber(episodeNumber)
          .setSeasonNumber(seasonNumber)
          .setShowTitle(showTitle)
          .setSeasonTitle(seasonTitle)
          .setAirDateEpochMillis(airDateEpochMillis)
          .setAvailability(ContentAvailability.AVAILABILITY_AVAILABLE)
          .addGenres(genres)
          .addContentRatings(contentRatings == null ? Collections.<RatingSystem>emptyList()
              : EngagePlugin.<EngageContentRating, RatingSystem>mapToEngage(contentRatings))
          .build();
    }
  }

  private static class EngageTvSeasonEntry extends EngageEntry {
    public List<EngageAvailabilityWindow> availabilityTimeWindows;
    public List<EngageContentRating> contentRatings;
    public String infoPageUri;
    public String playBackUri;
    public String entityId;
    public int watchNextType;
    public String name; // required
    public List<EngageImage> posterImages; // required
    public long lastEngagementTimeMillis;
    public int lastPlayBackPositionTimeMillis;
    public int seasonNumber;
    public List<String> genres; // required
    public long firstEpisodeAirDateEpochMillis;
    public long latestEpisodeAirDateEpochMillis;
    public int episodeCount;

    protected TvSeasonEntity asEngage() {
      return new TvSeasonEntity.Builder()
          .addAllAvailabilityTimeWindows(availabilityTimeWindows == null ? Collections.<DisplayTimeWindow>emptyList()
              : EngagePlugin.<EngageAvailabilityWindow, DisplayTimeWindow>mapToEngage(availabilityTimeWindows))
          .setInfoPageUri(infoPageUri == null ? null : Uri.parse(infoPageUri))
          .setPlayBackUri(playBackUri == null ? null : Uri.parse(playBackUri))
          .setWatchNextType(watchNextType)
          .setEntityId(entityId)
          .setName(name)
          .addPosterImages(EngagePlugin.<EngageImage, Image>mapToEngage(posterImages))
          .setLastEngagementTimeMillis(lastEngagementTimeMillis)
          .setLastPlayBackPositionTimeMillis(lastPlayBackPositionTimeMillis)
          .setFirstEpisodeAirDateEpochMillis(firstEpisodeAirDateEpochMillis)
          .setLatestEpisodeAirDateEpochMillis(latestEpisodeAirDateEpochMillis)
          .setEpisodeCount(episodeCount)
          .setSeasonNumber(seasonNumber)
          .setAvailability(ContentAvailability.AVAILABILITY_AVAILABLE)
          .addGenres(genres)
          .addContentRatings(contentRatings == null ? Collections.<RatingSystem>emptyList()
              : EngagePlugin.<EngageContentRating, RatingSystem>mapToEngage(contentRatings))
          .build();
    }
  }

  private static class EngageTvShowEntry extends EngageEntry {
    public List<EngageAvailabilityWindow> availabilityTimeWindows;
    public List<EngageContentRating> contentRatings;
    public String infoPageUri;
    public String playBackUri;
    public String entityId;
    public int watchNextType;
    public String name; // required
    public List<EngageImage> posterImages; // required
    public long lastEngagementTimeMillis;
    public int lastPlayBackPositionTimeMillis;
    public List<String> genres; // required
    public long firstEpisodeAirDateEpochMillis;
    public long latestEpisodeAirDateEpochMillis;
    public int seasonCount;

    protected TvShowEntity asEngage() {
      return new TvShowEntity.Builder()
          .addAllAvailabilityTimeWindows(availabilityTimeWindows == null ? Collections.<DisplayTimeWindow>emptyList()
              : EngagePlugin.<EngageAvailabilityWindow, DisplayTimeWindow>mapToEngage(availabilityTimeWindows))
          .setInfoPageUri(infoPageUri == null ? null : Uri.parse(infoPageUri))
          .setPlayBackUri(playBackUri == null ? null : Uri.parse(playBackUri))
          .setWatchNextType(watchNextType)
          .setEntityId(entityId)
          .setName(name)
          .addPosterImages(EngagePlugin.<EngageImage, Image>mapToEngage(posterImages))
          .setLastEngagementTimeMillis(lastEngagementTimeMillis)
          .setLastPlayBackPositionTimeMillis(lastPlayBackPositionTimeMillis)
          .setFirstEpisodeAirDateEpochMillis(firstEpisodeAirDateEpochMillis)
          .setLatestEpisodeAirDateEpochMillis(latestEpisodeAirDateEpochMillis)
          .setAvailability(ContentAvailability.AVAILABILITY_AVAILABLE)
          .setSeasonCount(seasonCount)
          .addGenres(genres)
          .addContentRatings(contentRatings == null ? Collections.<RatingSystem>emptyList()
              : EngagePlugin.<EngageContentRating, RatingSystem>mapToEngage(contentRatings))
          .build();
    }
  }

  private static class EngageMovieEntry extends EngageEntry {
    public List<EngageAvailabilityWindow> availabilityTimeWindows;
    public List<EngageContentRating> contentRatings;
    public List<String> genres;
    public List<EngageUri> platformSpecificPlaybackUris;
    public List<EngageImage> posterImages;
    public String description;
    public boolean downloadedOnDevice;
    public long durationMillis;
    public String entityId;
    public String infoPageUri;
    public long lastEngagementTimeMillis;
    public long LastPlayBackPositionTimeMillis;
    public String name;
    public long releaseDateEpochMillis;
    public int watchNextType;

    protected MovieEntity asEngage() {
      return new MovieEntity.Builder()
          .addAllAvailabilityTimeWindows(availabilityTimeWindows == null ? Collections.<DisplayTimeWindow>emptyList()
              : EngagePlugin.<EngageAvailabilityWindow, DisplayTimeWindow>mapToEngage(availabilityTimeWindows))
          .addContentRatings(contentRatings == null ? Collections.<RatingSystem>emptyList()
              : EngagePlugin.<EngageContentRating, RatingSystem>mapToEngage(contentRatings))
          .addGenres(genres)
          .addPlatformSpecificPlaybackUris(
              EngagePlugin.<EngageUri, PlatformSpecificUri>mapToEngage(platformSpecificPlaybackUris))
          .addPosterImages(EngagePlugin.<EngageImage, Image>mapToEngage(posterImages))
          .setDescription(description)
          .setAvailability(ContentAvailability.AVAILABILITY_AVAILABLE)
          .setDownloadedOnDevice(downloadedOnDevice)
          .setDurationMillis(durationMillis)
          .setEntityId(entityId)
          .setInfoPageUri(infoPageUri == null ? null : Uri.parse(infoPageUri))
          .setLastEngagementTimeMillis(lastEngagementTimeMillis)
          .setLastPlayBackPositionTimeMillis(LastPlayBackPositionTimeMillis)
          .setName(name)
          .setReleaseDateEpochMillis(releaseDateEpochMillis)
          .setWatchNextType(watchNextType)
          .build();
    }
  }
}
